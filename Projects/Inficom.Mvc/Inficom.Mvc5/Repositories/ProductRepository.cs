using Inficom.Mvc5.Models;
using Inficom.Mvc5.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inficom.Mvc5.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly InficomMvcContext _context;

        public ProductRepository(InficomMvcContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            this._context = context;
        }

        public Product GetById(int? id)
        {
            return null; // _context.Products.Find(id);
        }

        public IEnumerable<Product> GetProducts()
        {
            return null; // _context.Products;
        }

        public async Task<Product> AddAsync(Product product)
        {
            return null;
        }

        public async Task<Product> UpdateAsync(Product product)
        {
            return null;
        }
    }
}