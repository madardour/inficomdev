using Inficom.Mvc5.Models;
using Inficom.Mvc5.Repositories.Interfaces;
using Inficom.Mvc5.ViewModels;
using PagedList;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace Inficom.Mvc5.Controllers
{
    public class ProductController : Controller
    {
        private readonly IProductRepository _productRepo;

        public ProductController(IProductRepository repo)
        {
            if (repo == null)
            {
                throw new ArgumentNullException(nameof(repo));
            }
            this._productRepo = repo;
        }

        // GET: Product
        public ActionResult Index(string sortOrder, string currentFilter, string searchString, int? page)
        {
            MvcApplication.MyLogger.Debug($"Debug");
            MvcApplication.MyLogger.Info($"Info");
            MvcApplication.MyLogger.Warn($"Warn");
            MvcApplication.MyLogger.Error($"Erro");
            MvcApplication.MyLogger.Fatal($"Fatal");

            var products = _productRepo.GetProducts();
            ViewBag.CurrentSort = sortOrder;
            ViewBag.NameSortParm = String.IsNullOrEmpty(sortOrder) ? "name_desc" : "";

            if (searchString != null)
            {
               page = 1;
            }
            else { searchString = currentFilter; }
            ViewBag.CurrentFilter = searchString;

            switch (sortOrder)
            {
                case "name_desc":
                    products = products.OrderByDescending(p => p.ProductName);                    
                    break;
                default:
                    products = products.OrderBy(p => p.CategoryID);
                    break;
            }

            int pageSize = 3;
            int pageNumber = (page ?? 1);
            return View(products.ToPagedList(pageNumber, pageSize));
        }

        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }

            Product product = _productRepo.GetById(id);
            if (product == null)
            {
                return HttpNotFound();
            }
            return View(product);
        }

        public ActionResult Category()
        {
            IEnumerable<ProductCategories> data = from product in _productRepo.GetProducts().OrderBy(p => p.CategoryID)
                                                   group product by product.CategoryID into catGroup
                                                   select new ProductCategories()
                                                   {
                                                       Category = catGroup.Key.ToString(),
                                                       ProductCount = catGroup.Count()
                                                   };
            return View(data.ToList());
        }
    }
}