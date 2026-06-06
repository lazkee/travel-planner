using AutoMapper;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Mapping;

public class ExpenseProfile : Profile
{
    public ExpenseProfile()
    {
        CreateMap<Expense, ExpenseDto>();
        CreateMap<ExpenseRequestDto, Expense>();
    }
}