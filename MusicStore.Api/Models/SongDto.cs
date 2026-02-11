namespace MusicStore.Api.Models;

public class SongDto
{
    public int Index { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Artist { get; set; } = string.Empty;
    public string Album { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public int Likes { get; set; }
    public string CoverImageBase64 { get; set; } = string.Empty;
    public string MusicDataBase64 { get; set; } = string.Empty;
    public string Review { get; set; } = string.Empty;
    public List<string> Lyrics { get; set; } = new();
}

