using JobTracker.Modules.Billing.Invoices;
using JobTracker.Modules.Jobs.IntegrationEvents;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Billing;

public static class DependencyInjection
{
    public static IServiceCollection AddBillingModule(
        this IServiceCollection services)
    {
        services.AddSingleton<IInvoiceStore, PostgresInvoiceStore>();
        services.AddTransient<IGenerateInvoiceJob, GenerateInvoiceJob>();
        return services;
    }
}
