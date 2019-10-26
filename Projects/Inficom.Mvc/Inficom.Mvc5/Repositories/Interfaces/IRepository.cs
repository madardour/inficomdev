using Inficom.Mvc5.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Inficom.Mvc5.Repositories.Interfaces
{
    public interface IRepository<T>
    {
        IEnumerable<T> Get();

        T GetById(int id);

        Task<Product> AddAsync(Product entity);

        Task<Product> UpdateAsync(Product entity);
    }
}