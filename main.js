var Random = require('random-js')
    marqdown = require('./marqdown.js'),
    fs = require('fs'),
    //stackTrace = require('stack-trace')
    stackTrace = require('stacktrace-parser')
    ;

var fuzzer = 
{
    random : new Random(Random.engines.mt19937().seed(0)),
    
    seed: function (kernel)
    {
        fuzzer.random = new Random(Random.engines.mt19937().seed(kernel));
    },

    mutate:
    {
        string: function(val)
        {
            // MUTATE IMPLEMENTATION HERE
            var array = val.split('');

            if( fuzzer.random.bool(0.05) )
            {
                // REVERSE
                array.reverse()
            }
            // delete random characters
            if( fuzzer.random.bool(0.25) )
            {
                
            }


            return array.join('');
        }
    }
};

fuzzer.seed(0);
//var markDown = fs.readFileSync('simple.md','utf-8');
mutationTesting(['test.md','simple.md'],1000);

function mutationTesting(paths,iterations)
{
    var failedTests = [];
    var reducedTests = [];
    var passedTests = 0;

    var path = paths[0];
    
    var markDown = fs.readFileSync(path,'utf-8');
    for (var i = 0; i < iterations; i++) {

        var mutuatedString = fuzzer.mutate.string(markDown);

        try
        {
            marqdown.render(mutuatedString);
            passedTests++;
        }
        catch(e)
        {
            failedTests.push( {input:mutuatedString, stack: e.stack} );
        }
    }

    // RESULTS OF FUZZING
    for( var i =0; i < failedTests.length; i++ )
    {
        var failed = failedTests[i];

        var trace = stackTrace.parse( failed.stack );
        var msg = failed.stack.split("\n")[0];
        console.log( msg, trace[0].methodName, trace[0].lineNumber );
    }

    console.log( "passed {0}, failed {1}, reduced {2}".format(passedTests, failedTests.length, reducedTests.length) );

}

exports.mutationTesting = mutationTesting;
exports.fuzzer = fuzzer;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}