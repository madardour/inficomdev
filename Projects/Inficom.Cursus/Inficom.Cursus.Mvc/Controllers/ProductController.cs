using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Inficom.Cursus.Mvc.Models;
using Inficom.Cursus.Data.Entities;
using Inficom.Cursus.Data.Interfaces;
using AutoMapper;

namespace Inficom.Cursus.Mvc.Controllers
{
    public class ProductController : Controller
    {
        private readonly ILogger<ProductController> _logger;
        private readonly IMapper _mapper;
        private readonly IRepository<Product> _repoProducts;

        public ProductController(ILogger<ProductController> logger, IMapper mapper, IRepository<Product> repoProducts)
        {
            _logger = logger;
            _mapper = mapper;
            _repoProducts = repoProducts;
        }

        public IActionResult Index()
        {
            List<Product> products = _repoProducts.Get().Take(1).ToList();
            List<ProductModel> vm = _mapper.Map<List<Product>, List<ProductModel>>(products);

            return View(vm);
        }

        public IActionResult Productlist()
        {
            List<Product> products = _repoProducts.Get().Take(1).ToList();
            List<ProductModel> vm = _mapper.Map<List<Product>, List<ProductModel>>(products);

            return View(vm);
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
