using Hangfire;
using Hangfire.PostgreSql;
using JobTracker.Modules.Jobs.Application.Abstractions;
using JobTracker.Modules.Jobs.Domain.Repositories;
using JobTracker.Modules.Jobs.Infrastructure.BackgroundJobs;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using JobTracker.Modules.Jobs.Infrastructure.Persistence.Outbox;
using JobTracker.Modules.Jobs.Infrastructure.Persistence.Repositories;
using JobTracker.SharedKernel.Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Jobs.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddJobsInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException("Connection string 'Database' is not configured.");

        services.AddSingleton<InsertOutboxMessagesInterceptor>();

        services.AddDbContext<JobsDbContext>((serviceProvider, options) =>
        {
            var interceptor = serviceProvider.GetRequiredService<InsertOutboxMessagesInterceptor>();

            options
                .UseNpgsql(connectionString)
                .UseSnakeCaseNamingConvention()
                .AddInterceptors(interceptor);
        });

        services.AddScoped<JobRepository>();
        services.AddScoped<IJobRepository>(provider =>
            provider.GetRequiredService<JobRepository>());
        services.AddScoped<IJobReadRepository>(provider =>
            provider.GetRequiredService<JobRepository>());
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(connectionString)));

        services.AddHangfireServer();

        services.AddScoped<ProcessOutboxMessagesJob>();

        return services;
    }

    public static void UseJobsOutboxProcessing(this IServiceProvider services)
    {
        RecurringJob.AddOrUpdate<ProcessOutboxMessagesJob>(
            "jobs-process-outbox",
            job => job.Execute(CancellationToken.None),
            "*/1 * * * *");
    }
}
