using Inficom.Cursus.Data.Interfaces;
using Inficom.Cursus.Data.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Inficom.Cursus.Data.Repositories
{
    public class ProductRepository : IRepository<Product>
    {
        private readonly NorthwindContext context;

        public ProductRepository(NorthwindContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            this.context = context;
        }

        public IEnumerable<Product> Get()
        {
            return this.context.Product.Include(p => p.Category);
        }

        public Product GetById(int id)
        {
            return this.context.Product.Find(id);
        }

        public async Task<Product> AddAsync(Product entity)
        {
            context.Product.Add(entity);
            await context.SaveChangesAsync();
            return entity;
        }

        public async Task<Product> UpdateAsync(Product entity)
        {
            context.Product.Update(entity);
            await context.SaveChangesAsync();
            return entity;
        }

        public void Delete(int id)
        {
            var product = this.context.Product.Find(id);
            context.Product.Remove(product);
            context.SaveChanges();
        }
    }
}
