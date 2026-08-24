using FluentValidation;

namespace JobTracker.Modules.Jobs.Application.Jobs.SearchJobs;

internal sealed class SearchJobsQueryValidator
    : AbstractValidator<SearchJobsQuery>
{
    public SearchJobsQueryValidator()
    {
        RuleFor(query => query.OrganizationId)
            .NotEmpty();

        RuleFor(query => query.Page)
            .GreaterThan(0);

        RuleFor(query => query.PageSize)
            .InclusiveBetween(1, 100);

        RuleFor(query => query)
            .Must(query => query.From is null
                || query.To is null
                || query.From <= query.To)
            .WithMessage("From must be less than or equal to To.");
    }
}
