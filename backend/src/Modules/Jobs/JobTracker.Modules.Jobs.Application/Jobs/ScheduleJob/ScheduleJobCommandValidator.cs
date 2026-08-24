using FluentValidation;

namespace JobTracker.Modules.Jobs.Application.Jobs.ScheduleJob;

internal sealed class ScheduleJobCommandValidator
    : AbstractValidator<ScheduleJobCommand>
{
    public ScheduleJobCommandValidator()
    {
        RuleFor(command => command.JobId)
            .NotEmpty();

        RuleFor(command => command.ScheduledDate)
            .NotEmpty();

        RuleFor(command => command.AssigneeId)
            .NotEmpty();
    }
}
