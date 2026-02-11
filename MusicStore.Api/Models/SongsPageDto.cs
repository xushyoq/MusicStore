namespace MusicStore.Api.Models;

public class SongsPageDto
{
    public List<SongDto> Songs { get; set; } = new();
    public int TotalPages { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
}

