using Inficom.Demo.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Demo.Data.Interfaces
{
    public interface IRepository<T>
    {
        IEnumerable<T> Get();

        T GetById(int id);

        Task<ProductModel> AddAsync(ProductModel entity);

        Task<ProductModel> UpdateAsync(ProductModel entity);
    }
}
