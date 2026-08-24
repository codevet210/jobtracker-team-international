using JobTracker.SharedKernel.Application;
using Microsoft.AspNetCore.Http;

namespace JobTracker.Modules.Jobs.Presentation;

internal static class ResultExtensions
{
    public static IResult ToHttpResult(this Result result)
    {
        if (result.IsSuccess)
        {
            return Results.NoContent();
        }

        return ToProblem(result.Error);
    }

    public static IResult ToHttpResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return Results.NoContent();
        }

        return ToProblem(result.Error);
    }

    public static IResult ToHttpResult<T>(this Result<T> result, Func<T, IResult> onSuccess)
    {
        if (result.IsSuccess)
        {
            return onSuccess(result.Value);
        }

        return ToProblem(result.Error);
    }

    private static IResult ToProblem(Error error)
    {
        var status = error.Code switch
        {
            "Jobs.NotFound" => StatusCodes.Status404NotFound,
            "Jobs.InvalidTransition" => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status400BadRequest
        };

        return Results.Problem(
            title: error.Code,
            detail: error.Description,
            statusCode: status);
    }
}
