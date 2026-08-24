using FluentValidation;

namespace JobTracker.Modules.Jobs.Application.Jobs.CreateJob;

internal sealed class CreateJobCommandValidator
    : AbstractValidator<CreateJobCommand>
{
    public CreateJobCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Description)
            .MaximumLength(2000);

        RuleFor(x => x.Street)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.City)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.State)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.ZipCode)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.CustomerId)
            .NotEmpty();

        RuleFor(x => x.OrganizationId)
            .NotEmpty();
    }
}