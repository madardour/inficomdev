using Inficom.Demo.Data;
using Inficom.Demo.Data.Interfaces;
using Inficom.Demo.Domain.Models;
using Inficom.Demo.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Demo.Services
{
    public class ProductService : IProductService
    {
        private readonly IRepository<ProductModel> repository;

        public ProductService(IRepository<ProductModel> repository)
        {
            if (repository == null)
            {
                throw new ArgumentNullException("repository");
            }
            this.repository = repository;
        }

        public ProductModel GetById(int id)
        {
            return repository.GetById(id);
        }

        public IEnumerable<ProductModel> GetProducts()
        {
            return repository.Get();
        }

        public async Task<ProductModel> AddAsync(ProductModel product)
        {
            return await repository.AddAsync(product);
        }

        public async Task<ProductModel> UpdateAsync(ProductModel product)
        {
            return await repository.UpdateAsync(product);
        }

    }
}
