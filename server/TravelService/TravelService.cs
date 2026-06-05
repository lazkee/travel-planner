using System.Fabric;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

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
                        .ConfigureServices(services =>
                        {
                            services.AddControllers();
                            services.AddEndpointsApiExplorer();
                            services.AddSwaggerGen();
                        })
                        .Configure(app =>
                        {
                            app.UseRouting();
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
