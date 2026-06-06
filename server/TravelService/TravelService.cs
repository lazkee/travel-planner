using System.Fabric;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelService.Data;
using TravelService.Mapping;
using TravelService.Services;

namespace TravelService;

internal sealed class TravelService : StatelessService
{
    public TravelService(StatelessServiceContext context) : base(context) { }

    protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners() =>
        new[]
        {
            new ServiceInstanceListener(context =>
                new KestrelCommunicationListener(context, "ServiceEndpoint", (url, listener) =>
                    new WebHostBuilder()
                        .UseKestrel()
                        .UseContentRoot(Directory.GetCurrentDirectory())
                        .ConfigureAppConfiguration((ctx, config) =>
                        {
                            config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: false);
                        })
                        .ConfigureServices((ctx, services) =>
                        {
                            services.AddControllers();
                            services.AddEndpointsApiExplorer();
                            services.AddSwaggerGen();
                            services.AddDbContext<TravelDbContext>(options =>
                                options.UseSqlServer(ctx.Configuration.GetConnectionString("DefaultConnection"),
                                    sqlOptions => sqlOptions.MigrationsHistoryTable("__TravelServiceMigrationsHistory")));

                            var jwtKey = ctx.Configuration["Jwt:Key"]!;
                            var jwtIssuer = ctx.Configuration["Jwt:Issuer"]!;
                            var jwtAudience = ctx.Configuration["Jwt:Audience"]!;

                            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                                .AddJwtBearer(options =>
                                {
                                    options.TokenValidationParameters = new TokenValidationParameters
                                    {
                                        ValidateIssuer = true,
                                        ValidateAudience = true,
                                        ValidateLifetime = true,
                                        ValidateIssuerSigningKey = true,
                                        ValidIssuer = jwtIssuer,
                                        ValidAudience = jwtAudience,
                                        IssuerSigningKey = new SymmetricSecurityKey(
                                            Encoding.UTF8.GetBytes(jwtKey))
                                    };
                                });

                            services.AddAuthorization();

                            services.AddAutoMapper(typeof(TravelPlanProfile).Assembly);
                            services.AddScoped<ITravelPlanService, TravelPlanService>();
                        })
                        .Configure(app =>
                        {
                            app.UseRouting();
                            app.UseAuthentication();
                            app.UseAuthorization();
                            app.UseSwagger();
                            app.UseSwaggerUI();
                            app.UseEndpoints(endpoints =>
                            {
                                endpoints.MapGet("/api/health", async ctx =>
                                    await ctx.Response.WriteAsJsonAsync(new { service = "TravelService", status = "OK" }));
                                endpoints.MapControllers();
                            });
                        })
                        .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                        .UseUrls(url)
                        .Build()))
        };
}