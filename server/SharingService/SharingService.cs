using System.Fabric;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using TravelPlanner.Shared;

namespace SharingService;

internal sealed class SharingService : StatefulService, ISharingService
{
    public SharingService(StatefulServiceContext context) : base(context) { }

    protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        => this.CreateServiceRemotingReplicaListeners();
}