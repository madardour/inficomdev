using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Cursus.Data.Interfaces
{
    public interface IRepositoryBase<TEntity> : IDisposable where TEntity : class
    {
        Task Add(TEntity obj);
        Task<TEntity> GetById(int? id);
        Task<IEnumerable<TEntity>> GetAll();
        Task Update(TEntity obj);
        Task Remove(TEntity obj);
    }
}
