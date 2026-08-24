using Hangfire.Dashboard;

internal sealed class HangfireAllowAnonymousFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        return true;
    }
}
