using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Inficom.Learning.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Inficom.Learning.Services.Interfaces;
using Inficom.Learning.Services;
using Inficom.Learning.Data.Interfaces;
using Inficom.Learning.Data.Repositories;
using Inficom.Learning.Domain.Models;
using Swashbuckle.AspNetCore.Swagger;

namespace Inficom.Learning.Api
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {                        
            var connection = @"Data Source=INFICOM-DEV2;Initial Catalog=Northwind;Integrated Security=True;";
            services.AddDbContext<NorthwindContext>(options => options.UseSqlServer(connection));

            services.AddTransient<IProductsService, ProductsService>();
            services.AddTransient(typeof(IRepository<ProductsModel>), typeof(ProductsRepository));

            // Register the Swagger generator, defining one or more Swagger documents
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info { Title = "My API", Version = "v1" });
            });

            // Add service and create Policy with options
            //services.AddCors();
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
            });

            // Add framework services.
            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();            
                        
            app.UseSwagger();
            // Enable middleware to serve swagger-ui (HTML, JS, CSS, etc.), specifying the Swagger JSON endpoint.
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
            });           

            app.UseCors("CorsPolicy");
            //app.UseCors(options => options.WithOrigins("http://localhost:2003").AllowAnyHeader().AllowAnyMethod());
          
            app.UseMvc();
        }
    }
}
