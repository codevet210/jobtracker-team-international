using JobTracker.SharedKernel.Application;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public static class JobErrors
{
    public static Error NotFound(Guid jobId) =>
        new(
            "Jobs.NotFound",
            $"The job with ID '{jobId}' was not found.");
}