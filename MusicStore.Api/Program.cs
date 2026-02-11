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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddScoped<IDataGeneratorService, DataGeneratorService>();
builder.Services.AddScoped<ICoverGeneratorService, CoverGeneratorService>();
builder.Services.AddScoped<IMusicGeneratorService, MusicGeneratorService>();

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors("AllowReactApp");
app.UseRouting();

// Add root route for health check
app.MapGet("/", () => new { message = "Music Store API", version = "1.0", endpoints = new[] { "/api/songs", "/api/songs/{index}" } });

app.MapControllers();

// Configure port from Render's PORT environment variable
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{port}");

app.Run();

