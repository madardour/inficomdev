using Inficom.Mvc5.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace Inficom.Mvc5.Repositories.Interfaces
{
    public interface IProductRepository
    {
        IEnumerable<Product> GetProducts();
        Product GetById(int? id);
        Task<Product> AddAsync(Product product);
        Task<Product> UpdateAsync(Product product);
    }
}