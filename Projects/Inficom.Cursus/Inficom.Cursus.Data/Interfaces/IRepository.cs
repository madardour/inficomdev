using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Cursus.Data.Interfaces
{
    public interface IRepository<T>
    {
        IEnumerable<T> Get();

        T GetById(int id);

        Task<T> AddAsync(T entity);

        Task<T> UpdateAsync(T entity);

        void Delete(int id);
    }
}
