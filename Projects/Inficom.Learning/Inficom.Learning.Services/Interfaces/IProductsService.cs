using Inficom.Learning.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Learning.Services.Interfaces
{
    public interface IProductsService
    {
        IEnumerable<ProductsModel> GetProducts();
        ProductsModel GetById(int id);
        Task<ProductsModel> AddAsync(ProductsModel products);
        Task<ProductsModel> UpdateAsync(ProductsModel products);
        void Delete(int id);
    }
}
