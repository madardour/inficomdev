using Inficom.Demo.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Demo.Services.Interfaces
{
    public interface IProductService
    {
        IEnumerable<ProductModel> GetProducts();
        ProductModel GetById(int id);
        Task<ProductModel> AddAsync(ProductModel product);
        Task<ProductModel> UpdateAsync(ProductModel product);

    }
}
