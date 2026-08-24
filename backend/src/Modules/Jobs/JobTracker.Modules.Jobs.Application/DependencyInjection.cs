using FluentValidation;
using JobTracker.Modules.Jobs.Application.Behaviors;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Jobs.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddJobsApplication(
        this IServiceCollection services)
    {
        services.AddMediatR(configuration =>
        {
            configuration.RegisterServicesFromAssembly(
                typeof(DependencyInjection).Assembly);

            configuration.AddOpenBehavior(
                typeof(ValidationBehavior<,>));
        });

        services.AddValidatorsFromAssembly(
            typeof(DependencyInjection).Assembly,
            includeInternalTypes: true);

        return services;
    }
}