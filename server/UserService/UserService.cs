using System.Fabric;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using UserService.Data;

namespace UserService;

internal sealed class UserService : StatelessService
{
    public UserService(StatelessServiceContext context) : base(context) { }

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
                            services.AddDbContext<UserDbContext>(options =>
                                options.UseSqlServer(ctx.Configuration.GetConnectionString("DefaultConnection"),
                                    sqlOptions => sqlOptions.MigrationsHistoryTable("__UserServiceMigrationsHistory")));
                        })
                        .Configure(app =>
                        {
                            app.UseRouting();
                            app.UseSwagger();
                            app.UseSwaggerUI();
                            app.UseEndpoints(endpoints =>
                            {
                                endpoints.MapGet("/api/health", async ctx =>
                                    await ctx.Response.WriteAsJsonAsync(new { service = "UserService", status = "OK" }));
                                endpoints.MapControllers();
                            });
                        })
                        .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                        .UseUrls(url)
                        .Build()))
        };
}