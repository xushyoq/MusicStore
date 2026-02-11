using MusicStore.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Disable file watching in production to avoid inotify limits
if (!builder.Environment.IsDevelopment())
{
    builder.Configuration.Sources.OfType<Microsoft.Extensions.Configuration.Json.JsonConfigurationSource>()
        .ToList()
        .ForEach(source => source.ReloadOnChange = false);
}

// Add services
builder.Services.AddControllers();
builder.Services.AddRazorPages();
builder.Services.AddScoped<IDataGeneratorService, DataGeneratorService>();
builder.Services.AddScoped<ICoverGeneratorService, CoverGeneratorService>();
builder.Services.AddScoped<IMusicGeneratorService, MusicGeneratorService>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseStaticFiles();
app.UseRouting();

app.MapRazorPages();
app.MapControllers();

// Configure port from Render's PORT environment variable
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();

