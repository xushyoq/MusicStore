using System.Text;
using System.Text.Json;

namespace MusicStore.Api.Services;

public class MusicGeneratorService : IMusicGeneratorService
{
    public Task<string> GenerateMusicAsync(long seed, string language)
    {
        // Generate music parameters that can be used by Tone.js on frontend
        // This is a simplified approach - you can make it more sophisticated
        var random = new Random((int)(seed % int.MaxValue));
        
        var musicData = new
        {
            seed = seed,
            tempo = random.Next(80, 140),
            notes = GenerateNotes(random, 16), // 16 bars
            instruments = new[] { "piano", "bass", "drums" }
        };

        var json = JsonSerializer.Serialize(musicData);
        var base64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
        return Task.FromResult(base64);
    }

    private List<string> GenerateNotes(Random random, int bars)
    {
        var notes = new[] { "C", "D", "E", "F", "G", "A", "B" };
        var octaves = new[] { 3, 4, 5 };
        var result = new List<string>();

        for (int i = 0; i < bars * 4; i++) // 4 beats per bar
        {
            var note = notes[random.Next(notes.Length)];
            var octave = octaves[random.Next(octaves.Length)];
            result.Add($"{note}{octave}");
        }

        return result;
    }
}

