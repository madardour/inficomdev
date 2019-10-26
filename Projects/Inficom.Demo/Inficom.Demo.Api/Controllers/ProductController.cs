using Inficom.Demo.Domain.Models;
using Inficom.Demo.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Inficom.Demo.Api.Controllers
{
    public class ProductController : ApiController
    {
        private readonly IProductService _service;

        /// <summary>
        /// Controller
        /// </summary>
        /// <param name="service"></param>
        public ProductController(IProductService service)
        {
            if (service == null)
            {
                throw new ArgumentNullException(nameof(service));
            }
            this._service = service;
        }

        public IHttpActionResult Get()
        {
            var result = _service.GetProducts();
            return Ok(result);
        }

        public IHttpActionResult Get(int id)
        {
            var result = _service.GetById(id);
            return Ok(result);
        }


        [Route("Product/AddProduct")]
        [HttpPost]
        public IHttpActionResult Post([FromBody] ProductModel product)
        {
            if (product == null)
            {
                return BadRequest("Product is null");
            }

            var result = this._service.AddAsync(product);

            return Ok(result);
        }
    }
}
