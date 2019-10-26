using Inficom.Learning.Data.Interfaces;
using Inficom.Learning.Domain.Models;
using Inficom.Learning.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Learning.Services
{
    public class ProductsService : IProductsService
    {
        private readonly IRepository<ProductsModel> repository;

        public ProductsService(IRepository<ProductsModel> repository)
        {
            if (repository == null)
            {
                throw new ArgumentNullException("repository");
            }
            this.repository = repository;
        }

        public ProductsModel GetById(int id)
        {
            return repository.GetById(id);
        }

        public IEnumerable<ProductsModel> GetProducts()
        {
            return repository.Get();
        }

        public async Task<ProductsModel> AddAsync(ProductsModel products)
        {
            return await repository.AddAsync(products);
        }

        public async Task<ProductsModel> UpdateAsync(ProductsModel products)
        {
            return await repository.UpdateAsync(products);
        }

        public void Delete(int id)
        {
            repository.Delete(id);
        }
    }
}
