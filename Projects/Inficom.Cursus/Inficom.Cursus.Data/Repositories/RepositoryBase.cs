using Inficom.Cursus.Data.Interfaces;
using Inficom.Cursus.Data.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Inficom.Cursus.Data.Repositories
{
    public abstract class RepositoryBase<TEntity> : IRepositoryBase<TEntity> where TEntity : class
    {
        protected readonly NorthwindContext db;

        public RepositoryBase(NorthwindContext context) =>
            db = context;

        public virtual async Task Add(TEntity obj)
        {
            db.Add(obj);
            await db.SaveChangesAsync();
        }

        public virtual async Task<IEnumerable<TEntity>> GetAll() =>
            await db.Set<TEntity>().ToListAsync();

        public virtual async Task<TEntity> GetById(int? id) =>
            await db.Set<TEntity>().FindAsync(id);

        public virtual async Task Remove(TEntity obj)
        {
            db.Set<TEntity>().Remove(obj);
            await db.SaveChangesAsync();
        }

        public virtual async Task Update(TEntity obj)
        {
            db.Entry(obj).State = EntityState.Modified;
            await db.SaveChangesAsync();
        }

        public void Dispose() =>
            db.Dispose();
    }
}
