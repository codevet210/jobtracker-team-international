using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace JobTracker.Modules.Jobs.Presentation;

public static class DependencyInjection
{
    public static IServiceCollection AddJobsPresentation(this IServiceCollection services)
    {
        return services;
    }

    public static WebApplication UseJobsModule(this WebApplication app)
    {
        app.MapJobsEndpoints();
        return app;
    }

    public static IApplicationBuilder UseJobsExceptionHandler(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(handler =>
        {
            handler.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerFeature>();
                if (feature?.Error is ValidationException validationException)
                {
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        title = "Validation.Failed",
                        errors = validationException.Errors
                            .Select(failure => new
                            {
                                failure.PropertyName,
                                failure.ErrorMessage
                            })
                    });
                    return;
                }

                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsJsonAsync(new
                {
                    title = "Server.Error",
                    detail = "An unexpected error occurred."
                });
            });
        });

        return app;
    }
}
