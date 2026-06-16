using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelPlanner.Shared.Common;
using UserService.Dtos;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _adminUserService.GetAllAsync();
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _adminUserService.GetByIdAsync(id);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] AdminUpdateUserRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _adminUserService.UpdateAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpPut("{id:int}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] AdminUpdateUserRoleRequestDto request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _adminUserService.UpdateRoleAsync(id, request);
        return result.IsSuccess ? Ok(result.Value) : MapError(result.Error!);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var currentAdminUserId = GetCurrentUserId();
        if (currentAdminUserId == null) return Unauthorized();

        var result = await _adminUserService.DeleteAsync(currentAdminUserId.Value, id);
        return result.IsSuccess ? NoContent() : MapError(result.Error!);
    }

    private int? GetCurrentUserId()
    {
        var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(value, out var id) ? id : null;
    }

    private IActionResult MapError(Error error) => error.Code switch
    {
        "Admin.UserNotFound"            => NotFound(new { message = error.Message }),
        "Admin.SelfDeleteNotAllowed"    => StatusCode(403, new { message = error.Message }),
        "Admin.AdminTargetForbidden"    => StatusCode(403, new { message = error.Message }),
        "Admin.TravelDataCleanupFailed" => StatusCode(502, new { message = error.Message }),
        _                               => BadRequest(new { message = error.Message })
    };
}
