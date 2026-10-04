using MaintenanceTickets.Api.DTOs;
using MaintenanceTickets.Api.Exceptions;
using MaintenanceTickets.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace MaintenanceTickets.Api.Controllers;

[ApiController]
[Route("api/tickets")]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _service;

    public TicketsController(ITicketService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var ticket = await _service.GetByIdAsync(id);
        return ticket is null ? NotFound() : Ok(ticket);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTicketDto dto)
    {
        try
        {
            var ticket = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, ticket);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> ChangeStatus(int id, ChangeStatusDto dto)
    {
        try
        {
            var ticket = await _service.ChangeStatusAsync(id, dto);
            return ticket is null ? NotFound() : Ok(ticket);
        }
        catch (BusinessRuleException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/history")]
    public async Task<IActionResult> GetHistory(int id) => Ok(await _service.GetHistoryAsync(id));
}
