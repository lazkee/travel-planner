using Microsoft.ServiceFabric.Services.Runtime;

ServiceRuntime.RegisterServiceAsync("UserServiceType",
    context => new UserService.UserService(context)).GetAwaiter().GetResult();

Thread.Sleep(Timeout.Infinite);
