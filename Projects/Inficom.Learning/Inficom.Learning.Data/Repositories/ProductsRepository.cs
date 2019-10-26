using Inficom.Learning.Data.Entities;
using Inficom.Learning.Data.Interfaces;
using Inficom.Learning.Data.Mappings;
using Inficom.Learning.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Learning.Data.Repositories
{
    public class ProductsRepository : IRepository<ProductsModel>
    {
        private readonly NorthwindContext context;

        public ProductsRepository(NorthwindContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            this.context = context;
        }

        public IEnumerable<ProductsModel> Get()
        {
            var predicate = ProductsMapping.GetProductPredicate();
            return this.context.Products.Select(predicate)
                                        .ToList();
        }

        public ProductsModel GetById(int id)
        {
            var predicate = ProductsMapping.GetProductPredicate();
            return this.context.Products.Where(x => x.ProductId == id)
                                        .Select(predicate)
                                        .FirstOrDefault();
        }
        public async Task<ProductsModel> AddAsync(ProductsModel entity)
        {
            var product = ProductsMapping.ToDataEntity(entity);
            context.Products.Add(product);
            await context.SaveChangesAsync();
            var productModel = ProductsMapping.ToModelEntity(product);
            return productModel;
        }        

        public async Task<ProductsModel> UpdateAsync(ProductsModel entity)
        {
            var product = ProductsMapping.ToDataEntity(entity);
            context.Products.Update(product);
            await context.SaveChangesAsync();
            var productModel = ProductsMapping.ToModelEntity(product);
            return productModel;
        }

        public void Delete(int id)
        {
            var product = this.context.Products.Where(x => x.ProductId == id).FirstOrDefault();
            context.Products.Remove(product);
            context.SaveChanges();
        }
    }
}
