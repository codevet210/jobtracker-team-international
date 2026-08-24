using JobTracker.Modules.Jobs.IntegrationEvents;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Notifications;

public static class DependencyInjection
{
    public static IServiceCollection AddNotificationsModule(
        this IServiceCollection services)
    {
        services.AddSingleton<INotifyCustomerJob, NotifyCustomerJob>();
        return services;
    }
}
