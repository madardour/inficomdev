using Inficom.WebApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Inficom.WebApi.Controllers
{
    public class ProductsController : ApiController
    {
        readonly InficomApiContext context = new InficomApiContext();

        // GET api/values
        public IEnumerable<Product> GetAllProducts()
        {
            return context.Products.ToList();
        }

        public IHttpActionResult GetProduct(int id)
        {
            var product = context.Products.Include("Category").FirstOrDefault((p) => p.ProductID == id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

    }
}
