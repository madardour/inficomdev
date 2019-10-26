using Inficom.Mvc5.Models;
using Inficom.Mvc5.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace Inficom.Mvc5.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly InficomMvcContext _context;

        public EmployeeRepository(InficomMvcContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException(nameof(context));
            }

            this._context = context;
        }

        public Employee GetById(int? id)
        {
            return _context.Employees.Find(id);
        }

        public IEnumerable<Employee> GetEmployees()
        {
            return _context.Employees;
        }

        public async Task<Employee> AddAsync(Employee employee)
        {
            return null;
        }

        public async Task<Employee> UpdateAsync(Employee employee)
        {
            return null;
        }
    }
}