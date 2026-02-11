using Bogus;
using MusicStore.Api.Models;

namespace MusicStore.Api.Services;

public class DataGeneratorService : IDataGeneratorService
{
    private readonly ICoverGeneratorService _coverGenerator;
    private readonly IMusicGeneratorService _musicGenerator;

    public DataGeneratorService(
        ICoverGeneratorService coverGenerator,
        IMusicGeneratorService musicGenerator)
    {
        _coverGenerator = coverGenerator;
        _musicGenerator = musicGenerator;
    }

    public async Task<List<SongDto>> GenerateSongsAsync(
        string language, long seed, double likes, int page, int pageSize)
    {
        // Combine seed with page number for reproducibility
        var combinedSeed = CombineSeed(seed, page);
        var randomizer = new Randomizer((int)(combinedSeed % int.MaxValue));

        var locale = GetLocale(language);
        var faker = new Faker(locale);
        faker.Random = new Randomizer((int)(combinedSeed % int.MaxValue));

        var songs = new List<SongDto>();
        var startIndex = (page - 1) * pageSize + 1;

        for (int i = 0; i < pageSize; i++)
        {
            var index = startIndex + i;
            var songSeed = CombineSeed(seed, index);
            
            var song = GenerateSong(index, language, songSeed, likes, faker);
            
            // Generate cover for list view (simpler, faster)
            song.CoverImageBase64 = await _coverGenerator.GenerateCoverAsync(
                song.Album, song.Artist, songSeed);
            
            songs.Add(song);
        }

        return songs;
    }

    public async Task<SongDto> GenerateSongDetailsAsync(
        int index, string language, long seed)
    {
        var songSeed = CombineSeed(seed, index);
        var locale = GetLocale(language);
        var faker = new Faker(locale);
        faker.Random = new Randomizer((int)(songSeed % int.MaxValue));

        var song = GenerateSong(index, language, songSeed, 5.0, faker);
        
        // Generate cover and music
        song.CoverImageBase64 = await _coverGenerator.GenerateCoverAsync(
            song.Album, song.Artist, songSeed);
        song.MusicDataBase64 = await _musicGenerator.GenerateMusicAsync(
            songSeed, language);
        song.Review = GenerateReview(faker);
        song.Lyrics = GenerateLyrics(faker);

        return song;
    }

    private SongDto GenerateSong(
        int index, string language, long seed, double avgLikes, Faker faker)
    {
        var likes = GenerateLikes(avgLikes, seed);
        
        return new SongDto
        {
            Index = index,
            Title = faker.Music.Random.Words(faker.Random.Int(2, 5)),
            Artist = faker.Random.Bool() 
                ? faker.Name.FullName() 
                : faker.Company.CompanyName(),
            Album = faker.Random.Bool(0.3f) 
                ? "Single" 
                : faker.Music.Random.Words(faker.Random.Int(1, 4)),
            Genre = faker.Music.Genre(),
            Likes = likes
        };
    }

    private int GenerateLikes(double avgLikes, long seed)
    {
        var random = new Random((int)(seed % int.MaxValue));
        
        if (avgLikes == 0) return 0;
        if (avgLikes >= 10) return 10;

        // Probabilistic generation
        var fractionalPart = avgLikes - Math.Floor(avgLikes);
        var baseLikes = (int)Math.Floor(avgLikes);
        var hasExtraLike = random.NextDouble() < fractionalPart;

        return Math.Min(10, baseLikes + (hasExtraLike ? 1 : 0));
    }

    private List<string> GenerateLyrics(Faker faker)
    {
        return faker.Lorem.Sentences(faker.Random.Int(10, 20))
            .Select(s => s.Trim())
            .ToList();
    }

    private string GenerateReview(Faker faker)
    {
        return string.Join(" ", faker.Lorem.Sentences(faker.Random.Int(3, 6)));
    }

    private long CombineSeed(long seed, int pageOrIndex)
    {
        // MAD operation: Multiply-Add-Divide
        return (seed * 31 + pageOrIndex) % (long.MaxValue / 2);
    }

    private string GetLocale(string language)
    {
        // Bogus locale codes
        return language switch
        {
            "de-DE" => "de",
            "uk-UA" => "uk",
            _ => "en_US"
        };
    }
}

