using Hangfire;
using Hangfire.Dashboard;
using System.Text.Json.Serialization;
using JobTracker.Modules.Billing;
using JobTracker.Modules.Jobs.Application;
using JobTracker.Modules.Jobs.Infrastructure;
using JobTracker.Modules.Jobs.Infrastructure.Persistence;
using JobTracker.Modules.Jobs.Presentation;
using JobTracker.Modules.Notifications;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .WithOrigins(
                builder.Configuration["Frontend:Origin"] ?? "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddJobsApplication();
builder.Services.AddJobsInfrastructure(builder.Configuration);
builder.Services.AddJobsPresentation();
builder.Services.AddBillingModule();
builder.Services.AddNotificationsModule();

var app = builder.Build();

app.UseJobsExceptionHandler();
app.UseCors("frontend");
app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new IDashboardAuthorizationFilter[]
    {
        new HangfireAllowAnonymousFilter()
    }
});

app.MapGet("/", () => Results.Ok(new
{
    application = "JobTracker",
    status = "Running"
}));

app.UseJobsModule();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<JobsDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await BillingSchema.EnsureCreatedAsync(
        builder.Configuration.GetConnectionString("Database")!);
}

app.Services.UseJobsOutboxProcessing();

app.Run();

public partial class Program;
