using Microsoft.AspNetCore.Mvc;
using MusicStore.Api.Models;
using MusicStore.Api.Services;

namespace MusicStore.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly IDataGeneratorService _dataGenerator;
    private readonly ICoverGeneratorService _coverGenerator;
    private readonly IMusicGeneratorService _musicGenerator;
    private const int PageSize = 10;
    private const int TotalSongs = 1000;

    public SongsController(
        IDataGeneratorService dataGenerator,
        ICoverGeneratorService coverGenerator,
        IMusicGeneratorService musicGenerator)
    {
        _dataGenerator = dataGenerator;
        _coverGenerator = coverGenerator;
        _musicGenerator = musicGenerator;
    }

    [HttpGet]
    public async Task<ActionResult<SongsPageDto>> GetSongs(
        [FromQuery] string language = "en-US",
        [FromQuery] long seed = 0,
        [FromQuery] double likes = 5.0,
        [FromQuery] int page = 1)
    {
        var songs = await _dataGenerator.GenerateSongsAsync(
            language, seed, likes, page, PageSize);

        var totalPages = (int)Math.Ceiling(TotalSongs / (double)PageSize);

        return Ok(new SongsPageDto
        {
            Songs = songs,
            TotalPages = totalPages,
            CurrentPage = page,
            PageSize = PageSize
        });
    }

    [HttpGet("{index}")]
    public async Task<ActionResult<SongDto>> GetSongDetails(
        int index,
        [FromQuery] string language = "en-US",
        [FromQuery] long seed = 0)
    {
        var song = await _dataGenerator.GenerateSongDetailsAsync(
            index, language, seed);

        return Ok(song);
    }
}

