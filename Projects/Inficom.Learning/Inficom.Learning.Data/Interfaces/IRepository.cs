using Inficom.Learning.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Learning.Data.Interfaces
{
    public interface IRepository<T>
    {
        IEnumerable<T> Get();

        T GetById(int id);

        Task<ProductsModel> AddAsync(ProductsModel entity);

        Task<ProductsModel> UpdateAsync(ProductsModel entity);

        void Delete(int id);
    }
}
