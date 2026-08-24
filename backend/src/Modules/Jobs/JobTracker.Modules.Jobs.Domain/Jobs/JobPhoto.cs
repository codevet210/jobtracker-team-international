using JobTracker.SharedKernel.Domain;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public sealed class JobPhoto : Entity
{
    private JobPhoto(Guid id)
        : base(id)
    {
    }

    internal static JobPhoto Create(
        string url,
        DateTimeOffset capturedAt,
        string? caption)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(url);

        return new JobPhoto(Guid.NewGuid())
        {
            Url = url,
            CapturedAt = capturedAt,
            Caption = caption
        };
    }

    public string Url { get; private set; } = null!;

    public DateTimeOffset CapturedAt { get; private set; }

    public string? Caption { get; private set; }
}