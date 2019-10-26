using Microsoft.AspNetCore.Mvc;
using Inficom.Learning.Services.Interfaces;
using Inficom.Learning.Domain.Models;
using System;
using Microsoft.AspNetCore.Cors;

namespace Inficom.Learning.Api.Controllers
{
    [EnableCors("CorsPolicy"), Route("api/products")]
    public class ProductsController : Controller
    {
        private readonly IProductsService _service;

        public ProductsController(IProductsService service)
        {
            if (service == null)
            {
                throw new ArgumentNullException(nameof(service));
            }
            this._service = service;
        }

        // GET api/values
        [HttpGet]
        public IActionResult Get()
        {
            var result = _service.GetProducts();
            return Ok(result);
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var result = _service.GetById(id);
            if(result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        // POST api/values
        //[Route("AddProduct")]
        [HttpPost]
        public IActionResult Post([FromBody]ProductsModel products)
        {
            if (products == null)
            {
                return BadRequest("Products is null");
            }

            var result = this._service.AddAsync(products);

            return Ok(result);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody]ProductsModel products)
        {
            if (products == null || products.ProductID != id)
            {
                return BadRequest();
            }

            if (_service.GetById(id) == null)
            {
                return NotFound();
            }

            var result = this._service.UpdateAsync(products);

            return Ok(result);
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (_service.GetById(id) == null)
            {
                return NotFound();
            }

            this._service.Delete(id);

            return new NoContentResult();
        }
    }
}
