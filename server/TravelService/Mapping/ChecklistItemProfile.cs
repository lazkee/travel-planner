using AutoMapper;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Mapping;

public class ChecklistItemProfile : Profile
{
    public ChecklistItemProfile()
    {
        CreateMap<ChecklistItem, ChecklistItemDto>();
        CreateMap<ChecklistItemRequestDto, ChecklistItem>();
    }
}