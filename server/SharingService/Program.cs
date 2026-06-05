using Microsoft.ServiceFabric.Services.Runtime;

ServiceRuntime.RegisterServiceAsync("SharingServiceType",
    context => new SharingService.SharingService(context)).GetAwaiter().GetResult();

Thread.Sleep(Timeout.Infinite);
