using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using TravelService.Dtos;
using TravelService.Services;

namespace TravelService.Controllers;

[ApiController]
[Route("api/travel-plans/{planId:int}/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;

    public ExpensesController(IExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(int planId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _expenseService.GetForPlanAsync(userId.Value, planId);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int planId, int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _expenseService.GetByIdAsync(userId.Value, planId, id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPost]
    public async Task<IActionResult> Create(int planId, [FromBody] ExpenseRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _expenseService.CreateAsync(userId.Value, planId, request);
        if (result.IsFailure) return MapError(result.Error!);

        return CreatedAtAction(nameof(GetById), new { planId, id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int planId, int id, [FromBody] ExpenseRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _expenseService.UpdateAsync(userId.Value, planId, id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int planId, int id)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var result = await _expenseService.DeleteAsync(userId.Value, planId, id);
        return result.IsSuccess ? NoContent() : MapError(result.Error!);
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(value, out var id) ? id : null;
    }

    private IActionResult MapError(Error error) => error.Code switch
    {
        "TravelPlan.NotFound" => NotFound(new { message = error.Message }),
        "Expense.NotFound" => NotFound(new { message = error.Message }),
        "TravelPlan.Forbidden" => StatusCode(403, new { message = error.Message }),
        _ => BadRequest(new { message = error.Message })
    };
}