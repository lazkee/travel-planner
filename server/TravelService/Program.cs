using Microsoft.ServiceFabric.Services.Runtime;

ServiceRuntime.RegisterServiceAsync("TravelServiceType",
    context => new TravelService.TravelService(context)).GetAwaiter().GetResult();

Thread.Sleep(Timeout.Infinite);
