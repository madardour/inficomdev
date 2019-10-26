using Inficom.Demo.Data.Interfaces;
using Inficom.Demo.Data.Mappings;
using Inficom.Demo.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Demo.Data.Repositories
{
    public class ProductRepository : IRepository<ProductModel>
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

        public async Task<ProductModel> AddAsync(ProductModel entity)
        {
            var product = ProductMapping.ToDataEntity(entity);
            context.Products.Add(product);
            await context.SaveChangesAsync();
            var productModel = ProductMapping.ToModelEntity(product);
            return productModel;
        }

        public IEnumerable<ProductModel> Get()
        {
            var predicate = ProductMapping.GetProductPredicate();
            return this.context.Products.Select(predicate)
                                        .ToList();
        }

        public ProductModel GetById(int id)
        {
            var predicate = ProductMapping.GetProductPredicate();
            return this.context.Products.Where(x => x.ProductID == id)
                                        .Select(predicate)
                                        .FirstOrDefault();
        }

        public Task<ProductModel> UpdateAsync(ProductModel entity)
        {
            throw new NotImplementedException();
        }
    }
}
